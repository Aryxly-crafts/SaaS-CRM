"""
Lead Ingestion Bridge — Push Maps Scraper output to Aryxly CRM
Usage:
    python export_to_crm.py path/to/scraped_leads.csv
    python export_to_crm.py path/to/scraped_leads.json
    python export_to_crm.py --sample (tests with 3 sample leads)
"""

import sys
import os
import json
import csv
import argparse
import requests

# Local Dev or Production Vercel URL
CRM_API_URL = os.getenv("CRM_API_URL", "http://localhost:3000/api/leads/ingest")
CRM_API_KEY = os.getenv("INGEST_API_KEY", "")

def push_leads_to_crm(leads, workspace_type="team", allow_duplicates=False):
    """Sends leads to the SaaS-CRM ingestion API endpoint."""
    headers = {"Content-Type": "application/json"}
    if CRM_API_KEY:
        headers["x-api-key"] = CRM_API_KEY

    payload = {
        "workspace_type": workspace_type,
        "allowDuplicates": allow_duplicates,
        "leads": leads
    }

    try:
        print(f"📡 Sending {len(leads)} leads to {CRM_API_URL} ({workspace_type} workspace)...")
        response = requests.post(CRM_API_URL, json=payload, headers=headers, timeout=30)
        result = response.json()

        if response.status_code == 200 and result.get("success"):
            print(f"✅ Success! {result.get('insertedCount')} leads inserted into CRM.")
            if result.get("duplicatesSkipped"):
                print(f"⚠️  {result.get('duplicatesSkipped')} duplicate leads skipped.")
        else:
            print(f"❌ Error ({response.status_code}): {result.get('error')}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to CRM API. Make sure your Next.js server is running (`npm run dev`).")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def parse_file(file_path):
    """Loads CSV or JSON exported by the Maps scraper."""
    ext = os.path.splitext(file_path)[1].lower()
    leads = []

    if ext == ".json":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            leads = data if isinstance(data, list) else [data]

    elif ext == ".csv":
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Map typical scraper column names to CRM schema
                lead = {
                    "business_name": row.get("title") or row.get("name") or row.get("business_name") or row.get("query"),
                    "category": row.get("category") or row.get("type") or row.get("industry"),
                    "phone": row.get("phone") or row.get("phone_number") or row.get("tel"),
                    "address": row.get("address") or row.get("full_address") or row.get("location"),
                    "notes": f"Rating: {row.get('rating', 'N/A')} ({row.get('reviews', 0)} reviews) | Website: {row.get('website', 'N/A')}",
                    "source": "Google Maps Scraper"
                }
                if lead["business_name"]:
                    leads.append(lead)
    else:
        print(f"Unsupported file format: {ext}. Use .csv or .json")
        sys.exit(1)

    return leads

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export scraped leads into Aryxly CRM")
    parser.add_argument("file", nargs="?", help="Path to CSV or JSON file from scraper")
    parser.add_argument("--workspace", choices=["team", "personal"], default="team", help="Target workspace")
    parser.add_argument("--allow-duplicates", action="store_true", help="Allow duplicate phone/names")
    parser.add_argument("--sample", action="store_true", help="Send 3 sample leads for testing")

    args = parser.parse_args()

    if args.sample:
        sample_leads = [
            {
                "business_name": "Apex Dental Studio",
                "category": "Dentist",
                "phone": "+91 98450 12345",
                "address": "Indiranagar, Bangalore",
                "estimated_value": 85000,
                "notes": "Rating: 4.9 (140 reviews) | Website: apexdental.in | Needs website redesign",
                "source": "Google Maps Scraper"
            },
            {
                "business_name": "Zenith Fitness Hub",
                "category": "Gym",
                "phone": "+91 99801 54321",
                "address": "Koramangala, Bangalore",
                "estimated_value": 60000,
                "notes": "Rating: 4.7 (95 reviews) | Lead generated via Maps automation",
                "source": "Google Maps Scraper"
            }
        ]
        push_leads_to_crm(sample_leads, workspace_type=args.workspace, allow_duplicates=args.allow_duplicates)
    elif args.file:
        leads = parse_file(args.file)
        if leads:
            push_leads_to_crm(leads, workspace_type=args.workspace, allow_duplicates=args.allow_duplicates)
        else:
            print("No valid leads found in file.")
    else:
        parser.print_help()
