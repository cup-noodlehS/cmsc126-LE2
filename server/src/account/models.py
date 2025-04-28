from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.validators import RegexValidator, EmailValidator
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom user model that extends Django's AbstractUser.
    
    This model adds additional fields for user profiles including contact information,
    profile picture, and location. It overrides the email field to make it unique.
    """
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        verbose_name=_("Email address"),
        help_text=_("Required. Must be a valid email address.")
    )
    
    # Override related_name to avoid clashes with auth.User
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",
        blank=True,
        help_text=_("The groups this user belongs to."),
        verbose_name=_("groups"),
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",
        blank=True,
        help_text=_("Specific permissions for this user."),
        verbose_name=_("user permissions"),
    )

    phone_number = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r"^\+?1?\d{9,15}$",
                message=_("Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."),
            )
        ],
        verbose_name=_("Phone number"),
        help_text=_("International format preferred: +[country code][number]")
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        app_label = "account"
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]

    @property
    def full_name(self):
        """Return the user's full name or username if name is not set."""
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.username

    def save(self, *args, **kwargs):
        """Override save method to handle password hashing and email normalization."""
        # Hash password if it's not already hashed
        if self.password and not self.password.startswith("pbkdf2_sha256$"):
            self.password = make_password(self.password)
            
        # Normalize email to lowercase
        if self.email:
            self.email = self.email.lower()
            
        super().save(*args, **kwargs)

    def __str__(self):
        """String representation of the user."""
        return f"{self.full_name} - ({self.email})"
