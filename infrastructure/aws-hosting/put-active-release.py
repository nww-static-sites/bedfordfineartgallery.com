#!/usr/bin/env python3
"""Guarded activation/rollback, sharing the publisher's exact contract."""
import argparse
import json
from bedford_routing_store import RoutingStore

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--kvs-arn', required=True)
    parser.add_argument('--release', required=True)
    parser.add_argument('--expected', default='')
    args = parser.parse_args()
    print(json.dumps(RoutingStore(args.kvs_arn).activate(args.release,args.expected), sort_keys=True))

if __name__ == '__main__':
    main()
