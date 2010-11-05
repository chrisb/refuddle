require 'refuddle'

log = File.new("sinatra.log", "a")

STDOUT.reopen(log)
STDERR.reopen(log)

run Sinatra::Application