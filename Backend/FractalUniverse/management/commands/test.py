from django.core.management.base import BaseCommand
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.http import MediaInMemoryUpload
from googleapiclient.discovery import build
import io
import urllib

class Command(BaseCommand):
    help = "Oups"

    def handle(self, *args, **options):
        credentials = service_account.Credentials.from_service_account_file(settings.GOOGLE_API_AUTH_FILE, scopes=[
            "https://www.googleapis.com/auth/drive"
        ])
        service = build("drive", "v3", credentials=credentials, cache_discovery=False)
        result = service.files().list().execute()
        for file in result["files"]:
            service.files().delete(fileId=file["id"]).execute()
        print(result)
        result = {"files":[]}
        try:
            folderId = result["files"][0]["id"]
        except IndexError:
            file = service.files().create(
                body={
                    "name": "Fractals",
                    "mimeType": "application/vnd.google-apps.folder"
                },
                fields="id,webContentLink"
            ).execute()
            print(file)
            folderId = file["id"]
            service.permissions().create(fileId=folderId, body={
                "role": "reader",
                "type": "anyone"
            }).execute()
            file = service.files().create(
                body={
                    "name": "test",
                    "mimeType": "application/json",
                    "parents": [folderId]
                },
                fields="id",
                media_body=MediaInMemoryUpload(b"123", mimetype="application/json"),
            ).execute()
            print(file["id"])
            service.permissions().create(fileId=file["id"], body={
                "role": "reader",
                "type": "anyone"
            }).execute()
        f = service.files().get(fileId=folderId, fields="webViewLink").execute()
        print(f)
        print(folderId)
        # file = service.files().create(
        #     body={
        #         "name": "fractal"
        #     },
        #     media_body=MediaInMemoryUpload("123", mimetype="image/jpeg"),
        #     fields="webContentLink,id"
        # ).execute()
        # service.permissions().create(fileId=file.get("id"), body={
        #     "role": "reader",
        #     "type": "anyone"
        # }).execute()
        # print(file)
        # url = file.get("webContentLink")
        # response = urllib.request.urlopen(url)
        # url = response.geturl()
        # print("Redirect url: " + url)
        # return (file.get("id"), url)
