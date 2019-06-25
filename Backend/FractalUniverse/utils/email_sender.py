from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.core.mail import send_mail


def send_verification_email(user, token):
    mail = "{}, {} https://lprohl.pythonanywhere.com/activate/{}/{}".format(
        user.login,
        _("to complete registaration click link:"),
        user.id,
        token.key
    )
    send_mail(
        "FractalUniverse account activation",
        mail,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False
    )
