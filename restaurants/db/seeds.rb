# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require 'json'

File.open(File.join(Rails.root, "/db/seeds/location_matching-5-km.txt")).each_line do |line|
    values = line.strip.split("\t")
    restaurants_tuples = values[1]
    re = /\([^\)]*\)/
    matches = restaurants_tuples.scan(re).to_a
    matches.each { |restaurant| 
        rest_name = restaurant.split(",")[1]
        tweet = values[5]       
        if tweet
            text = JSON.parse(tweet)["text"]
            rest_tweet = {"tweet" => text, "restaurant" => rest_name}
            RestaurantTweet.create(rest_tweet)
        end
    }
end

File.open(File.join(Rails.root, "/db/seeds/location_matching-10-m.tsv")).each_line do |line|
    fields = line.strip.split("\t")
    url = fields[5]
    caption = fields[7]
    restaurant = fields[0]
    instagram = {"url" => url, "caption" => caption, "restaurant" => restaurant}
    Instagram.create(instagram)
end

