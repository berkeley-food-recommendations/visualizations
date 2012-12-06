class RestaurantsController < ApplicationController
  def view
  end

  def rest_data
    rests = File.read("app/assets/restaurants-berkeley-all.json")
    render :json => rests
  end

  def rest_counts
    rests = File.read("app/assets/counts.json")
    render :json => rests
  end

  def get_tweets
    name = params[:rest_name]
    # sort by ascending since we'll seed Derrick's data first, and then the geolocated data
    rest_tweets = RestaurantTweet.find_all_by_restaurant(name, :order=> 'created_at asc')
    render :json => rest_tweets.map { |rest_tweet|
      {
        :text => rest_tweet.tweet,
        :username => rest_tweet.username,
        :source => rest_tweet.source
      }
    }
  end

  def get_instagrams
    name = params[:rest_name]
    rest_instas = Instagram.find_all_by_restaurant(name, :select => "DISTINCT url, caption, username", :order => 'taken_at asc')
    render :json => rest_instas.map { |insta| {"caption" => insta.caption, "url" => insta.url, "username" => insta.username} }
  end

  def rests_in_common
    rest = params[:rest_name]
    tweet_rests_common = RestaurantTweet.rests_in_common(rest)
    render :json => tweet_rests_common
  end

end