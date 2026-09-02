#!/usr/bin/env python3

import argparse
import json
import re
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


def current_value(kvs_arn: str) -> str:
    result = subprocess.run(
        ["aws", "cloudfront-keyvaluestore", "get-key", "--kvs-arn", kvs_arn, "--key", "@active", "--output", "json", "--no-cli-pager"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        if "ResourceNotFoundException" in result.stderr:
            return ""
        raise RuntimeError("Active release could not be read")
    return str(json.loads(result.stdout).get("Value") or "")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kvs-arn", required=True)
    parser.add_argument("--release", required=True)
    parser.add_argument("--expected", default="")
    args = parser.parse_args()
    if not re.fullmatch(r"[0-9a-f]{40}", args.release):
        raise RuntimeError("Release SHA is invalid")
    if args.expected and not re.fullmatch(r"[0-9a-f]{40}", args.expected):
        raise RuntimeError("Expected release SHA is invalid")
    observed = current_value(args.kvs_arn)
    if observed == args.release:
        print(f"active_release=pass previous={observed} current={args.release} idempotent=true")
        return
    if observed != args.expected:
        raise RuntimeError(f"Active release compare-and-swap failed: expected {args.expected or '<empty>'}, observed {observed or '<empty>'}")
    description = aws("cloudfront-keyvaluestore", "describe-key-value-store", "--kvs-arn", args.kvs_arn)
    aws(
        "cloudfront-keyvaluestore",
        "update-keys",
        input_json={
            "KvsARN": args.kvs_arn,
            "IfMatch": description["ETag"],
            "Puts": [{"Key": "@active", "Value": args.release}],
        },
    )
    if current_value(args.kvs_arn) != args.release:
        raise RuntimeError("Active release verification failed")
    print(f"active_release=pass previous={observed or '<empty>'} current={args.release}")


if __name__ == "__main__":
    main()
