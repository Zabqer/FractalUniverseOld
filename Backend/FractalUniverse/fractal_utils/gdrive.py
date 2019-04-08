from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.http import MediaInMemoryUpload
from googleapiclient.discovery import build
import io

credentials = service_account.Credentials.from_service_account_file(settings.GOOGLE_API_AUTH_FILE, scopes = [
    "https://www.googleapis.com/auth/drive"
])
service = build("drive", "v3", credentials = credentials)

def addFractalImage(fractal_id, image):
    with io.BytesIO() as fh:
        image.save(fh, format = "JPEG", quality = 100)
        fh.seek(0)
        file = service.files().create(
            body = {
                "name": "fractal" + str(fractal_id) + ".jpg"
            },
            media_body = MediaInMemoryUpload(fh.read(), mimetype="image/jpeg"),
            fields = "webContentLink,id"
        ).execute()
        service.permissions().create(fileId = file.get("id"), body={
            "role": "reader",
            "type": "anyone"
        }).execute()
        print(file)
        return (file.get("id"), file.get("webContentLink"))
