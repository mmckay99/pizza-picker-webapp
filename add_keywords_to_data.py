from random import randint

# Michael McKay
# This script adds keywords to the restaurant CSV data
# provided by the lecturer. It does this randomly,
# Doing this manually would be a big task.

# First open the styles.txt file, on each line is
# one style. Store the styles in an array.
# REMEMBER NOT TO STORE NATIONAL ONES
styles_file = open("styles.txt", "r")
styles = [x.rstrip() for x in styles_file.readlines() if (not x[0].isupper())]

# Now open restaurants.csv
restaurants_csv = open("restaurants.csv")

expected_commas_for_line_without_keywords = 2

restaurants_csv_lines = restaurants_csv.readlines()
restaurants_new_csv_lines = []

modified_line = ""
cafeFoundPosition = 0

max_lines = 1500

for line in restaurants_csv_lines[0:max_lines]:
    # Is this line one without keywords?
    modified_line = line
    if (line.find(",,") > 0):
            # There are no keywords in this line. Choose some randomly.
            number_of_keywords = randint(3,8)
            new_keywords = []
            for _ in range(number_of_keywords):
                new_keywords += [styles[randint(0, len(styles) - 1)]]

            # Add the keyword "cafe" if the restaurant name includes cafe.
            cafeFoundPosition = line.lower().find("cafe")
            restaurantCafeCanteenFoundPosition = line.find("Restaurant/Cafe/Canteen")
            if (cafeFoundPosition < restaurantCafeCanteenFoundPosition):
                new_keywords += ["cafe"]

            # Now we have constructed the new array of keywords,
            # add them on to the new line.
            modified_line = line.replace(",,", ", " + " ".join(new_keywords) + ",")


    # Find the second to last comma. This is the comma just before the keyword list.
    last_comma_position = modified_line.rfind(",")
    second_last_comma_position = modified_line.rfind(",", last_comma_position - 1)

    existing_keywords = modified_line[second_last_comma_position:last_comma_position].split(" ")
    for existing_keyword in existing_keywords:
        if existing_keyword not in styles:
            styles += [existing_keyword]

    # Now add the new line into the restaurants_new.csv
    restaurants_new_csv_lines += modified_line
    
# Overwrite styles.txt
styles_file = open("styles_new.txt", "w")
styles_file.writelines([style + "\n" for style in styles])

restaurants_new_csv = open("restaurants_new.csv", "w")
restaurants_new_csv.writelines(restaurants_new_csv_lines)