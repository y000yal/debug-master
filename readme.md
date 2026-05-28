# LogMate – Error Log Viewer, Debug Logger & PHP/JS Log Manager

**WordPress debug log viewer** — read PHP & JS **logs**, search errors, purge **logs**, and **export logs** from your admin dashboard.

## Features

- Modern admin interface
- Real-time log viewing with auto-refresh
- Advanced filtering and search capabilities
- Group duplicate errors with occurrence counts
- Identify error sources (Core/Plugin/Theme)
- Log purging by date or keep last N days/weeks/months
- Toggle debug logging with one click
- JavaScript error logging support
- Secure log file location
x
## Installation

1. Upload the plugin files to the `/wp-content/plugins/logmate` directory, or install it via the WordPress plugin screen.
2. Activate through the 'Plugins' menu.
3. Configure via **LogMate** menu in WordPress admin.

## Development

### Setup

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
pnpm install

# Run development server with hot reload
pnpm run hot

# Build for production
pnpm run build
```

### Hot Reload

To enable hot reload during development:

1. Run `pnpm run hot` in the plugin directory
2. Add this to your `wp-config.php`:
   ```php
   define( 'LOGMATE_HOT_RELOAD', true );
   ```

## Requirements

- WordPress 5.0+
- PHP 7.4+
- Node.js 16+ (for development)

## License

GPLv2 or later

