<?php
function sarl_tbi_setup() {
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'sarl_tbi_setup');

function sarl_tbi_assets() {
    $base = get_template_directory_uri();
    $path = get_template_directory();
    wp_enqueue_style('sarl-tbi-icons', $base . '/assets/public/vendor/fontawesome/icons.css', array(), filemtime($path . '/assets/public/vendor/fontawesome/icons.css'));
    wp_enqueue_style('sarl-tbi-site', $base . '/assets/styles.css', array('sarl-tbi-icons'), filemtime($path . '/assets/styles.css'));
    wp_enqueue_script('sarl-tbi-content', $base . '/assets/content/cro-content.js', array(), filemtime($path . '/assets/content/cro-content.js'), true);
    wp_enqueue_script('sarl-tbi-site', $base . '/assets/script.js', array(), filemtime($path . '/assets/script.js'), true);
    wp_enqueue_script('sarl-tbi-gallery', $base . '/assets/gallery.js', array(), filemtime($path . '/assets/gallery.js'), true);
}
add_action('wp_enqueue_scripts', 'sarl_tbi_assets');
