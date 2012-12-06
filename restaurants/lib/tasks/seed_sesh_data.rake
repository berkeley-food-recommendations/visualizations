require 'json'

namespace :db do
    desc "Adds in Sesh's geolocated data"
    task :seed_geolocated => :environment do

        # Seed the database with tweets matched by location to a restaurant
        File.open(File.join(Rails.root, "/db/seeds/location_matching-200-m.txt")).each_line do |line|
            source = "geolocation"
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
                    rest_tweet = {"tweet" => text, "restaurant" => rest_name, "username" => username, "source" => source}
                    RestaurantTweet.create(rest_tweet)
                end
            }
        end
    end

end
