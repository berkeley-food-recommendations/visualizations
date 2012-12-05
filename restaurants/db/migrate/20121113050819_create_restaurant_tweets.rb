class CreateRestaurantTweets < ActiveRecord::Migration
  def change
    create_table :restaurant_tweets do |t|
      t.string :restaurant
      t.text :tweet
      t.string :username
      t.timestamps
    end
    add_index :restaurant_tweets, :restaurant
  end
end
