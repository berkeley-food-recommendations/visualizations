class RestaurantTweet < ActiveRecord::Base
  attr_accessible :restaurant, :tweet, :username

 def self.rests_in_common(rest)
    tweets = self.find_all_by_restaurant(rest)
    rests = {}
    tweets.each do |tweeter|
        user_tweets = self.find_all_by_username(tweeter.username)
        user_tweets.each do |user_tweet|
            if rests.has_value?(user_tweet.restaurant)
                rests[user_tweet.restaurant] += 1
            else
                rests[user_tweet.restaurant] = 1
            end
        end
    end
    return rests
  end
end

