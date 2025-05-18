
export interface Product {
  ingredients_text_pl?: string;
  image_nutrition_thumb_url?: string;
  nutrition_score_warning_fruits_vegetables_nuts_estimate_from_ingredients?: number;
  pnns_groups_2_tags?: string[];
  nutriments?: Nutriments;
  link?: string;
  last_image_t?: number;
  labels_hierarchy?: string[];
  last_modified_t?: number;
  nutrition_data_prepared_per?: string;
  image_nutrition_small_url?: string;
  _id?: string;
  labels_tags?: string[];
  nutrition_grades?: string;
  purchase_places_tags?: string[];
  categories_tags?: string[];
  data_sources?: string;
  packaging_tags?: string[];
  traces_from_ingredients?: string;
  ingredients_debug?: string[];
  additives_old_tags?: any[];
  unknown_nutrients_tags?: any[];
  last_modified_by?: string;
  completed_t?: number;
  other_nutritional_substances_tags?: any[];
  ingredients_analysis_tags?: string[];
  serving_size?: string;
  image_thumb_url?: string;
  creator?: string;
  nutrition_data_per?: string;
  manufacturing_places?: string;
  allergens_from_user?: string;
  unknown_ingredients_n?: string;
  max_imgid?: string;
  product_quantity?: string;
  data_sources_tags?: string[];
  generic_name_pl?: string;
  ingredients_that_may_be_from_palm_oil_n?: number;
  completeness?: number;
  scans_n?: number;
  additives_n?: number;
  categories_lc?: string;
  states?: string;
  nova_group_debug?: string;
  ingredients_from_palm_oil_n?: number;
  ingredients_text_en?: string;
  categories_hierarchy?: string[];
  generic_name_en?: string;
  ingredients?: Ingredient[];
  cities_tags?: any[];
  entry_dates_tags?: string[];
  lc?: string;
  ingredients_from_or_that_may_be_from_palm_oil_n?: number;
  emb_codes_20141016?: string;
  last_edit_dates_tags?: string[];
  data_quality_tags?: string[];
  nutriscore_grade?: string;
  stores?: string;
  countries_lc?: string;
  generic_name?: string;
  data_quality_errors_tags?: any[];
  debug_param_sorted_langs?: string[];
  countries_hierarchy?: string[];
  vitamins_tags?: any[];
  allergens?: string;
  languages?: Languages;
  nutriscore_data?: NutriscoreData;
  traces_tags?: any[];
  ingredients_text_debug?: string;
  selected_images?: SelectedImages;
  rev?: number;
  traces_lc?: string;
  photographers_tags?: string[];
  image_nutrition_url?: string;
  image_front_thumb_url?: string;
  image_ingredients_thumb_url?: string;
  nutriscore_score?: number;
  labels_lc?: string;
  nucleotides_prev_tags?: any[];
  allergens_from_ingredients?: string;
  nutrient_levels?: NutrientLevels;
  additives_prev_original_tags?: any[];
  expiration_date?: string;
  pnns_groups_2?: string;
  nutrition_data?: string;
  image_front_url?: string;
  ingredients_original_tags?: string[];
  labels?: string;
  origins_tags?: string[];
  popularity_tags?: string[];
  emb_codes?: string;
  countries_tags?: string[];
  allergens_tags?: string[];
  ingredients_text_with_allergens?: string;
  image_front_small_url?: string;
  additives_tags?: any[];
  allergens_lc?: string;
  pnns_groups_1_tags?: string[];
  correctors_tags?: string[];
  last_image_dates_tags?: string[];
  languages_tags?: string[];
  nutrient_levels_tags?: string[];
  traces_from_user?: string;
  misc_tags?: string[];
  product_name_pl?: string;
  ingredients_text?: string;
  vitamins_prev_tags?: any[];
  additives_debug_tags?: any[];
  manufacturing_places_tags?: string[];
  nutrition_score_warning_no_fiber?: number;
  purchase_places?: string;
  interface_version_created?: string;
  languages_codes?: LanguagesCodes;
  stores_tags?: any[];
  code?: string;
  categories?: string;
  ingredients_n_tags?: string[];
  serving_quantity?: string;
  image_small_url?: string;
  _keywords?: string[];
  quantity?: string;
  minerals_prev_tags?: any[];
  informers_tags?: string[];
  traces?: string;
  traces_hierarchy?: any[];
  sortkey?: number;
  states_hierarchy?: string[];
  nutrition_grade_fr?: string;
  origins?: string;
  product_name?: string;
  unique_scans_n?: number;
  ingredients_hierarchy?: string[];
  ingredients_ids_debug?: string[];
  data_quality_info_tags?: string[];
  codes_tags?: string[];
  interface_version_modified?: string;
  ingredients_tags?: string[];
  ingredients_text_with_allergens_pl?: string;
  lang?: string;
  brands?: string;
  emb_codes_tags?: string[];
  nutrition_grades_tags?: string[];
  packaging?: string;
  countries?: string;
  languages_hierarchy?: string[];
  additives_original_tags?: any[];
  images?: Images;
  checkers_tags?: any[];
  nucleotides_tags?: any[];
  nutrition_score_beverage?: number;
  image_ingredients_small_url?: string;
  allergens_hierarchy?: string[];
  update_key?: string;
  image_ingredients_url?: string;
  ingredients_from_palm_oil_tags?: any[];
  data_quality_bugs_tags?: any[];
  data_quality_warnings_tags?: string[];
  minerals_tags?: any[];
  no_nutrition_data?: string;
  product_name_en?: string;
  nova_group_tags?: string[];
  amino_acids_prev_tags?: any[];
  compared_to_category?: string;
  id?: string;
  last_editor?: string;
  pnns_groups_1?: string;
  complete?: number;
  states_tags?: string[];
  nutrition_data_prepared?: string;
  image_url?: string;
  amino_acids_tags?: any[];
  additives_old_n?: number;
  ingredients_that_may_be_from_palm_oil_tags?: any[];
  emb_codes_orig?: string;
  ingredients_n?: string;
  nutrition_score_warning_fruits_vegetables_nuts_estimate_from_ingredients_value?: number;
  created_t?: number;
  ingredients_text_with_allergens_en?: string;
  brands_tags?: string[];
  editors_tags?: string[];
}

export interface Images {
  "1"?: The1;
  "2"?: The2;
  "3"?: The2;
  "4"?: The2;
  "5"?: The2;
  ingredients_pl?: Pl;
  front_pl?: Pl;
  front?: FrontEnClass;
  nutrition_pl?: Pl;
  front_en?: FrontEnClass;
}

export interface The1 {
  uploaded_t?: string;
  sizes?: Sizes;
  uploader?: string;
}

export interface Sizes {
  "100"?: The100;
  "400"?: The100;
  full?: The100;
  "200"?: The100;
}

export interface The100 {
  h?: number;
  w?: number;
}

export interface The2 {
  uploader?: string;
  sizes?: Sizes;
  uploaded_t?: number;
}

export interface FrontEnClass {
  normalize?: null;
  sizes?: Sizes;
  geometry?: string;
  imgid?: string;
  rev?: string;
  white_magic?: null;
}

export interface Pl {
  y1?: null | string;
  normalize?: null | string;
  geometry?: string;
  imgid?: string;
  sizes?: Sizes;
  y2?: null | string;
  angle?: null | string;
  x1?: null | string;
  x2?: null | string;
  white_magic?: null | string;
  rev?: string;
  ocr?: number;
  orientation?: string;
}

export interface Ingredient {
  percent_min?: number;
  percent_max?: number;
  rank?: number;
  id?: string;
  text?: string;
}

export interface Languages {
  "en:english"?: number;
  "en:polish"?: number;
}

export interface LanguagesCodes {
  pl?: number;
  en?: number;
}

export interface NutrientLevels {
  "saturated-fat"?: string;
  sugars?: string;
  salt?: string;
  fat?: string;
}

export interface Nutriments {
  "nutrition-score-fr"?: number;
  sodium_unit?: string;
  fat_unit?: string;
  sodium?: number;
  energy_serving?: number;
  proteins_unit?: string;
  sugars_100g?: number;
  sugars_unit?: string;
  "energy-kcal_value"?: number;
  energy_value?: number;
  salt_serving?: number;
  "energy-kcal"?: number;
  proteins_100g?: number;
  "saturated-fat_value"?: number;
  salt_value?: number;
  "saturated-fat_100g"?: number;
  sugars?: number;
  energy_unit?: string;
  "energy-kcal_unit"?: string;
  "saturated-fat_serving"?: number;
  sodium_value?: number;
  sodium_100g?: number;
  carbohydrates?: number;
  "saturated-fat"?: number;
  carbohydrates_100g?: number;
  fat?: number;
  energy?: number;
  sugars_value?: number;
  sodium_serving?: number;
  proteins?: number;
  "nutrition-score-fr_100g"?: number;
  salt_unit?: string;
  "energy-kcal_serving"?: number;
  "saturated-fat_unit"?: string;
  fat_value?: number;
  fat_100g?: number;
  sugars_serving?: number;
  salt?: number;
  fat_serving?: number;
  "energy-kcal_100g"?: number;
  proteins_value?: number;
  carbohydrates_serving?: number;
  salt_100g?: number;
  carbohydrates_unit?: string;
  carbohydrates_value?: number;
  energy_100g?: number;
  "fruits-vegetables-nuts-estimate-from-ingredients_100g"?: number;
  proteins_serving?: number;
}

export interface NutriscoreData {
  fiber_points?: number;
  saturated_fat_points?: number;
  is_cheese?: number;
  fiber?: number;
  proteins_points?: number;
  energy?: number;
  sugars_value?: number;
  proteins?: number;
  saturated_fat_value?: number;
  fruits_vegetables_nuts_colza_walnut_olive_oils_points?: number;
  negative_points?: number;
  energy_points?: number;
  is_beverage?: number;
  score?: number;
  fruits_vegetables_nuts_colza_walnut_olive_oils_value?: number;
  is_water?: number;
  saturated_fat_ratio_value?: number;
  proteins_value?: number;
  fruits_vegetables_nuts_colza_walnut_olive_oils?: number;
  positive_points?: number;
  saturated_fat_ratio_points?: number;
  sodium?: number;
  saturated_fat?: number;
  fiber_value?: number;
  is_fat?: number;
  sodium_value?: number;
  sodium_points?: number;
  saturated_fat_ratio?: number;
  grade?: string;
  sugars?: number;
  energy_value?: number;
  sugars_points?: number;
}

export interface SelectedImages {
  nutrition?: Ingredients;
  ingredients?: Ingredients;
  front?: SelectedImagesFront;
}

export interface SelectedImagesFront {
  small?: FrontDisplay;
  thumb?: FrontDisplay;
  display?: FrontDisplay;
}

export interface FrontDisplay {
  pl?: string;
  en?: string;
}

export interface Ingredients {
  display?: IngredientsDisplay;
  thumb?: IngredientsDisplay;
  small?: IngredientsDisplay;
}

export interface IngredientsDisplay {
  pl?: string;
}