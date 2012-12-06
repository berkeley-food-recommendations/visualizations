class RestaurantTweet < ActiveRecord::Base
  attr_accessible :restaurant, :tweet, :source, :username

  def self.rests_in_common(rest)
    user_tweets = self.
      find_by_sql(self.
              sanitize_sql_array([%Q{
SELECT * FROM restaurant_tweets
WHERE username IN
  (SELECT username FROM restaurant_tweets WHERE restaurant = ?);}, rest]))

    rests = {}
    user_tweets.each do |user_tweet|
      # weight the tweet by source. 1 for geolocation, 3 for name or handle appearing in the tweet
      increment = user_tweet.source == "geolocation" ? 1 : 3
      if rests.has_value?(user_tweet.restaurant)
        rests[user_tweet.restaurant] += increment
      else
        rests[user_tweet.restaurant] = increment
      end
    end
    return rests
  end
end
