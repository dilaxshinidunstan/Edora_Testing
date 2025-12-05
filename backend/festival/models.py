from django.db import models


class FestivalEntry(models.Model):
    GAME_CHOICES = [
        ("wordbuzz", "WordBuzz"),
        ("quiz", "Quick Quiz"),
    ]

    nickname = models.CharField(max_length=80)
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.nickname} - {self.game}"


