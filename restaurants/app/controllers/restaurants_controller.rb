class RestaurantsController < ApplicationController
  def view
  end

  def rest_data
    rests = File.read("app/assets/restaurants-berkeley-all.json")
    #rests = File.read("app/assets/fake_json.json")
    puts rests
    render :json => rests
  end

  def get_tweets
    @text = params[:rest_id]
    render :partial => "/restaurants/tweets.json"
  end

end
