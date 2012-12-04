class RestaurantsController < ApplicationController
  def view
  end

  def rest_data
    rests = File.read("app/assets/restaurants-berkeley-all.json")
    render :json => rests
  end

  def get_tweets
    name = params[:rest_name]
    rest_tweets = RestaurantTweet.find_all_by_restaurant(name)
    render :json => rest_tweets.map { |rest_tweet| {"text" => rest_tweet.tweet } }
  end

  def get_instagrams
    name = params[:rest_name]
    rest_instas = Instagram.find_all_by_restaurant(name, :order => 'taken_at asc')
    render :json => rest_instas.map { |insta| {"caption" => insta.caption, "url" => insta.url, "username" => insta.username} }
  end

end
