from django import forms
from django.contrib.auth.models import User
from .models import Trip


class SignupForm(forms.ModelForm):
    """
    Custom signup form.
    We build this manually (instead of UserCreationForm) so we have
    full control over fields, labels, and validation messages.
    """
    password = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter password'}),
        min_length=6,
    )
    confirm_password = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'placeholder': 'Re-enter password'}),
    )

    class Meta:
        model = User
        fields = ['username', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Choose a username'}),
            'email': forms.EmailInput(attrs={'placeholder': 'you@example.com'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise forms.ValidationError('An account with this email already exists.')
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('This username is already taken.')
        return username

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError('Passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


class LoginForm(forms.Form):
    """Simple login form: username + password."""
    username = forms.CharField(
        widget=forms.TextInput(attrs={'placeholder': 'Username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'})
    )


class TripForm(forms.ModelForm):
    """
    Form used to create AND edit a trip.
    'user' is NOT included here — it is set in the view from request.user,
    so a user can never assign a trip to someone else.
    """
    class Meta:
        model = Trip
        fields = ['name', 'start_date', 'end_date', 'description', 'cover_photo']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'e.g. Europe Summer Trip'}),
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': 'What is this trip about?'
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start_date')
        end = cleaned_data.get('end_date')
        if start and end and end < start:
            raise forms.ValidationError('End date cannot be before start date.')
        return cleaned_data
