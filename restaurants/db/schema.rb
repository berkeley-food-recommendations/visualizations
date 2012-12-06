# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121203190049) do

  create_table "instagrams", :force => true do |t|
    t.text     "url"
    t.text     "caption"
    t.string   "restaurant"
    t.string   "username"
    t.float    "taken_at"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "instagrams", ["restaurant"], :name => "index_instagrams_on_restaurant"

  create_table "restaurant_tweets", :force => true do |t|
    t.string   "restaurant"
    t.text     "tweet"
    t.string   "username"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "restaurant_tweets", ["restaurant"], :name => "index_restaurant_tweets_on_restaurant"

end
