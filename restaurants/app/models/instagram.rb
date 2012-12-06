class Instagram < ActiveRecord::Base
  attr_accessible :caption, :restaurant, :url, :username, :taken_at
end
