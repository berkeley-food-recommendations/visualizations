# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require 'json'

counter = 0
# Seed the database with tweets matched by location to a restaurant
File.open(File.join(Rails.root, "/db/seeds/location_matching-200-m.txt")).each_line do |line|
    values = line.strip.split("\t")
    restaurants_tuples = values[1]
    re = /\([^\)]*\)/
    matches = restaurants_tuples.scan(re).to_a
    matches.each { |restaurant|
        rest_name = restaurant.split(",")[1]
        tweet = values[5]
        if tweet
            text = JSON.parse(tweet)["text"]
            username = JSON.parse(tweet)["user"]["id_str"]
            rest_tweet = {:tweet => text, :restaurant => rest_name, :username => username}
            RestaurantTweet.create(rest_tweet)
        end
    }
  counter += 1
  puts "#{counter} RestaurantTweets added" if counter % 100 == 0
end

# Seed the database with instagram photos matched by location to a restaurant
File.open(File.join(Rails.root, "/db/seeds/location_matching-10-m.tsv")).each_line do |line|
    fields = line.strip.split("\t")
    url = fields[5]
    caption = fields[7]
    restaurant = fields[0]
    username = fields[4]
    taken_at = fields[6]
    instagram = {:url => url, :caption => caption, :restaurant => restaurant, :username => username, :taken_at => taken_at}
    Instagram.create(instagram)
end

# helper to insert tweet data
def insert_tweet(line)
    fields = line.strip.split("\t")
    text = fields[1]
    username = fields[2]
    rest_name = fields[3]
    rest_tweet = {:tweet => text, :restaurant => rest_name, :username => username}
    RestaurantTweet.create(rest_tweet)
end

# Seed the database with tweets whose text includes a restaurant name
File.open(File.join(Rails.root, "db/seeds/name_matching.tsv")).each_line do |line|
    insert_tweet(line)
end

# Seed the database with tweets from Matt's data
File.open(File.join(Rails.root, "db/seeds/twitter_handle_matching.tsv")).each_line do |line|
    insert_tweet(line)
end
