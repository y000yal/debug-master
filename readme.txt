=== LogMate – Error Log Viewer, Debug Logger & PHP/JS Log Manager ===
Contributors: y0000el
Tags: debug log, log viewer, export logs, logs, errors
Requires at least: 5.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress debug log viewer to read PHP & JS logs, search errors, purge logs, and export logs from your admin dashboard.

== Description ==

**LogMate** is a **debug log viewer** and **log manager** for WordPress. It helps you open, read, and work with your site **logs** without editing files on the server — including the WordPress **debug log**, **PHP log** entries, and **JavaScript error logs** in one place.

Use LogMate as your daily **log viewer** when debugging plugins, themes, or custom code. Filter and search **logs**, group duplicate errors, see where issues come from (Core, plugin, or theme), and **export logs** when you need to share them with a client or developer.

= Why use this debug log viewer? =

* **View debug logs** in a clean admin UI — no FTP or cPanel required
* **Log viewer** with search, filters, and optional auto-refresh
* Read **PHP logs** and **JS logs** separately or together
* **Export logs** by type (all, PHP, or JavaScript) and date range
* Purge old **logs** to keep file size under control
* Enable or disable WordPress debug logging from **Settings**
* Custom auto-refresh interval for live **log** monitoring

= Key Features =

* Modern **debug log** admin interface
* Real-time **log viewer** with configurable auto-refresh
* Search and filter **logs** (PHP, JS, or all)
* Group duplicate errors with occurrence counts
* Identify error sources (Core / Plugin / Theme)
* **Export logs** with date range filtering
* Purge **logs** by date or keep last N days/weeks/months
* Toggle WordPress debug logging with one click
* JavaScript error logging to a dedicated log file
* Secure log file location outside the web root when possible

= Perfect if you are looking for =

* WordPress **debug log** plugin
* **Log viewer** for `debug.log` and custom log paths
* Tool to **export logs** for support tickets
* **PHP log** and **JS log** manager in the dashboard
* Easier way to read **logs** than raw file access

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/logmate` directory, or install it via the WordPress plugin screen.
2. Activate through the **Plugins** menu.
3. Open **LogMate** in the admin menu to use the **log viewer**.
4. Enable debug logging in **Settings** if you need new entries in your **debug log**.

== Frequently Asked Questions ==

= What is LogMate? =

LogMate is a WordPress **debug log viewer** and **log manager**. It lets you read, search, purge, and **export logs** from the admin area instead of downloading `debug.log` over FTP or SSH.

= How do I view the WordPress debug log? =

1. Install and activate LogMate.
2. Go to **LogMate → Settings** and enable debug logging (this configures `WP_DEBUG` and related constants in `wp-config.php`).
3. Open **LogMate → Logs** to use the **log viewer**.

If the **debug log** is empty, trigger the issue you are debugging on the site, then refresh the **log viewer**.

= How do I enable WordPress debug logging? =

In **LogMate → Settings**, use the main logging toggle. LogMate can enable debug logging and set the log file path in `wp-config.php` for you. You can also turn logging off from the same screen when you are finished debugging.

= Where are my logs stored? =

PHP entries are written to your configured WordPress **debug log** file (often `wp-content/debug.log` or a custom path). JavaScript errors can be logged to a separate **JS log** file when that option is enabled in **Settings**. **System Info** shows file paths and sizes.

= Can I search and filter logs in the log viewer? =

Yes. The **Logs** screen includes search, log type filters (All, PHP, or JavaScript), sorting, and pagination so you can find specific errors quickly without opening raw **logs** in a text editor.

= Can I export logs? =

Yes. Click **Export** on the **Logs** screen to **export logs** as a downloadable file. Choose PHP **logs**, JavaScript **logs**, or all **logs**, and optionally restrict the export by date range.

= Can I delete or purge old logs? =

Yes. In **Settings**, use the purge options to remove **logs** before a date or keep only the last number of days, weeks, or months. You can purge all **logs**, PHP **logs** only, or JS **logs** only.

= Does the log viewer support auto-refresh? =

Yes. Enable **Auto-refresh logs** in **Settings**, then set a custom refresh interval (in seconds). The **log viewer** will reload **logs** automatically so new errors appear without manual refresh.

= Does this work with PHP and JavaScript logs? =

Yes. LogMate is a **debug log viewer** for both **PHP log** entries (PHP notices, warnings, errors, etc.) and **JS log** entries when JavaScript error logging is turned on in **Settings**.

= Do I still need FTP to read debug.log? =

No. LogMate is designed as an in-dashboard **log viewer** so you can read and **export logs** without FTP, cPanel File Manager, or SSH — as long as WordPress can write to the log files.

= Is it safe to use on a live site? =

Debug logging can grow large and may contain sensitive paths or data. LogMate helps you purge **logs** and **export logs** for review, but you should disable debug logging on production when you are not actively troubleshooting.

= Who can access the log viewer? =

Only users with the `manage_options` capability (typically administrators) can open LogMate, change **Settings**, purge **logs**, and **export logs**.

= Will this work with managed WordPress hosting? =

It should work on most managed hosts that allow `wp-config.php` changes and standard WordPress **debug log** locations. Some hosts use custom log paths or restrict `wp-config.php` edits — check **System Info** in LogMate or ask your host if logging cannot be enabled.

== Screenshots ==

1. Debug log viewer — browse and search logs in the admin
2. Export Logs
2. Settings — enable debug logging and export options
3. System info — PHP, server, and log file details

== Changelog ==

= 1.2.0 =
* Enhance - Copy and show previous logs from debug.log

= 1.1.0 =
* Enhance - Custom Refresh Interval
* Fix - Enable Log notice.

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.1.0 =
Improved log viewer with custom refresh interval and enable-log notice on the Logs screen.

= 1.0.0 =
Initial release of LogMate – Error Log Viewer, Debug Logger & PHP/JS Log Manager.
