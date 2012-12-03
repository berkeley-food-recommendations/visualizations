class CreateInstagrams < ActiveRecord::Migration
  def change
    create_table :instagrams do |t|
      t.text :url
      t.text :caption
      t.string :restaurant

      t.timestamps
    end
  end
end
