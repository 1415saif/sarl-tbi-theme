<?php
function sarl_tbi_setup() {
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'sarl_tbi_setup');

function sarl_tbi_assets() {
    $base = get_template_directory_uri();
    wp_enqueue_style('sarl-tbi-icons', $base . '/assets/public/vendor/fontawesome/icons.css', array(), '1.0');
    wp_enqueue_style('sarl-tbi-site', $base . '/assets/styles.css', array('sarl-tbi-icons'), '1.0');
    wp_enqueue_script('sarl-tbi-content', $base . '/assets/content/cro-content.js', array(), '1.0', true);
    wp_enqueue_script('sarl-tbi-site', $base . '/assets/script.js', array(), '1.0', true);
    wp_enqueue_script('sarl-tbi-gallery', $base . '/assets/gallery.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'sarl_tbi_assets');
