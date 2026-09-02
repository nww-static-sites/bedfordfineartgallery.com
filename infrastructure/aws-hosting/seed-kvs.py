#!/usr/bin/env python3

import argparse
import json
import subprocess
import tempfile
from pathlib import Path


def aws(*arguments: str, input_json: dict | None = None) -> dict:
    command = ["aws", *arguments, "--output", "json", "--no-cli-pager"]
    temporary_path = None
    try:
        if input_json is not None:
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as temporary:
                json.dump(input_json, temporary, separators=(",", ":"))
                temporary_path = Path(temporary.name)
            command.extend(["--cli-input-json", f"file://{temporary_path}"])
        result = subprocess.run(command, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return json.loads(result.stdout or "{}")
    finally:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)


def etag(kvs_arn: str) -> str:
    return str(aws("cloudfront-keyvaluestore", "describe-key-value-store", "--kvs-arn", kvs_arn)["ETag"])


def list_keys(kvs_arn: str) -> dict[str, str]:
    output: dict[str, str] = {}
    token = ""
    while True:
        arguments = ["cloudfront-keyvaluestore", "list-keys", "--kvs-arn", kvs_arn, "--max-results", "50"]
        if token:
            arguments.extend(["--next-token", token])
        response = aws(*arguments)
        for item in response.get("Items") or []:
            output[str(item["Key"])] = str(item.get("Value") or "")
        token = str(response.get("NextToken") or "")
        if not token:
            return output


def update(kvs_arn: str, puts: list[dict], deletes: list[dict]) -> None:
    changes = [("put", item) for item in puts] + [("delete", item) for item in deletes]
    for offset in range(0, len(changes), 50):
        batch = changes[offset:offset + 50]
        payload = {
            "KvsARN": kvs_arn,
            "IfMatch": etag(kvs_arn),
            "Puts": [item for operation, item in batch if operation == "put"],
            "Deletes": [item for operation, item in batch if operation == "delete"],
        }
        if not payload["Puts"]:
            payload.pop("Puts")
        if not payload["Deletes"]:
            payload.pop("Deletes")
        aws("cloudfront-keyvaluestore", "update-keys", input_json=payload)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kvs-arn", required=True)
    parser.add_argument("--routing", required=True)
    args = parser.parse_args()
    document = json.loads(Path(args.routing).read_text(encoding="utf-8"))
    release_sha = str(document.get("releaseSha") or "")
    if len(release_sha) != 40:
        raise RuntimeError("Routing release SHA is invalid")
    desired = {str(item["key"]): str(item["value"]) for item in document["records"]}
    existing = list_keys(args.kvs_arn)
    puts = [
        {"Key": key, "Value": value}
        for key, value in sorted(desired.items())
        if existing.get(key) != value
    ]
    deletes = [
        {"Key": key}
        for key in sorted(existing)
        if (key.startswith(f"r:{release_sha}:") or key == f"@config:{release_sha}") and key not in desired
    ]
    update(args.kvs_arn, puts, deletes)
    final = list_keys(args.kvs_arn)
    if any(final.get(key) != value for key, value in desired.items()):
        raise RuntimeError("KeyValueStore verification failed")
    stale = [
        key for key in final
        if (key.startswith(f"r:{release_sha}:") or key == f"@config:{release_sha}") and key not in desired
    ]
    if stale:
        raise RuntimeError("KeyValueStore retained stale routing keys")
    print(f"kvs_routing=pass records={len(desired)} puts={len(puts)} deletes={len(deletes)} digest={document['digest']}")


if __name__ == "__main__":
    main()
