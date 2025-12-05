from rest_framework import serializers
from .models import FestivalEntry


class FestivalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FestivalEntry
        fields = ["id", "nickname", "game", "created_at"]


