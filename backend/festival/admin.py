from django.contrib import admin
from .models import FestivalEntry


@admin.register(FestivalEntry)
class FestivalEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "nickname", "game", "created_at")
    list_filter = ("game", "created_at")
    search_fields = ("nickname",)



