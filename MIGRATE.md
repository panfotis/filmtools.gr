https://www.drupal.org/project/drupal/issues/3476043

copy all files to the d7files directory (check also the category_img folder)
ddev drush migrate:rollback d7_file
ddev drush migrate:reset-status d7_file
ddev drush migrate:status d7_file
ddev drush migrate:import d7_file -v




ddev drush migrate:import d7_node_complete:products --update

drush migrate:import d7_url_alias --update

