<?php
get_header();
if (is_front_page() && file_exists(get_theme_file_path('home.php'))) {
    include get_theme_file_path('home.php');
} else {
    while (have_posts()) {
        the_post();
        the_content();
    }
}
get_footer();
