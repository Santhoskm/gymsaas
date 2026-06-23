from django.apps import AppConfig

class ClientsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clients'      # ← change from 'clients' to 'apps.clients'
    label = 'clients'