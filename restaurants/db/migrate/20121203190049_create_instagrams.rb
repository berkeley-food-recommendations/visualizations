class CreateInstagrams < ActiveRecord::Migration
  def change
    create_table :instagrams do |t|
      t.text :url
      t.text :caption
      t.string :restaurant
      t.string :username
      t.float :taken_at
      t.timestamps
    end
    add_index :instagrams, :restaurant

  end
end
