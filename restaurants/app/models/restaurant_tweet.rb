class RestaurantTweet < ActiveRecord::Base
  attr_accessible :restaurant, :tweet, :source, :username

  def self.rests_in_common(rest)
    tweets = self.find_all_by_restaurant(rest)
    rests = {}
    tweets.each do |tweeter|
      user_tweets = self.find_all_by_username(tweeter.username)
      user_tweets.each do |user_tweet|
        # weight the tweet by source. 1 for geolocation, 3 for name or handle appearing in the tweet
        increment = user_tweet.source == "geolocation" ? 1 : 3
        if rests.has_value?(user_tweet.restaurant)
          rests[user_tweet.restaurant] += increment
        else
          rests[user_tweet.restaurant] = increment
        end
      end
    end
    return rests
  end
end
