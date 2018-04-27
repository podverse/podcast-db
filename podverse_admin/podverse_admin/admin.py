from django.contrib import admin

from .models import Podcasts, PodcastsAdmin

admin.site.register(Podcasts, PodcastsAdmin)