from django.db import models
from django.contrib.auth.models import User


class Trip(models.Model):
    """
    A trip created by a user.
    This is the core object of GlobeTrotter — everything else
    (stops, activities, expenses) will connect to this in later phases.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True)
    cover_photo = models.ImageField(upload_to='trip_covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def duration_days(self):
        """Number of days this trip spans, inclusive of start and end date."""
        return (self.end_date - self.start_date).days + 1
