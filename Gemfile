source "https://rubygems.org"

gem "jekyll", "4.4.1"

group :jekyll_plugins do
  gem "jekyll-feed", "0.12"
end

group :development do
  gem "rake", "13.3.0"
  gem "rspec", "3.13.0"
end

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "0.1", :platforms => [:mingw, :x64_mingw, :mswin]

gem "http_parser.rb", "0.6.0", :platforms => [:jruby]
