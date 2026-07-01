FROM php:8.4-cli-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache git unzip zip curl postgresql-dev $PHPIZE_DEPS \
    && docker-php-ext-install pdo_pgsql pgsql opcache \
    && pecl install redis \
    && docker-php-ext-enable redis opcache \
    && apk del $PHPIZE_DEPS

# PHP performance config
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.enable_cli=1'; \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=16'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.validate_timestamps=1'; \
        echo 'opcache.revalidate_freq=2'; \
        echo 'realpath_cache_size=4096K'; \
        echo 'realpath_cache_ttl=600'; \
    } > /usr/local/etc/php/conf.d/99-local-performance.ini

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Laravel project files (excluding .env, vendor, etc via .dockerignore)
COPY . .

# Install PHP dependencies (no dev, optimized for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create storage symlink structure and set permissions
RUN mkdir -p storage/app/public storage/framework/cache storage/framework/sessions \
        storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
