# Setting up admin accounts
Create a file `secret_config.py` with contents according to the following example:
```
ADMINS = [('admin_name_1', 'admin_password_1'), ('admin_name_2', 'admin_password_2')]
```

On startup, specified admin users that do not currently exist will be created.  To delete existing admin users, please use the admin panel.
