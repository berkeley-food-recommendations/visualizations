class CreateRestaurantTweets < ActiveRecord::Migration
  def change
    create_table :restaurant_tweets do |t|
      t.string :restaurant
      t.text :tweet

      t.timestamps
    end
    add_index :restaurant_tweets, :restaurant
  end
end
