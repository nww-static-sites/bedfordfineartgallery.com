#!/usr/bin/env python3
"""Operator entrypoint; the publisher uses the same persistent SDK helper."""
import argparse
import json
from pathlib import Path
from bedford_routing_store import RoutingStore

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--kvs-arn', required=True)
    parser.add_argument('--routing', required=True)
    args = parser.parse_args()
    document = json.loads(Path(args.routing).read_text(encoding='utf-8'))
    print(json.dumps(RoutingStore(args.kvs_arn).seed(document), sort_keys=True))

if __name__ == '__main__':
    main()
