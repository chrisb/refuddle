require 'rubygems'
require 'rest_client'
require 'json'
require 'sinatra'
require 'haml'
require 'date'
require 'time'

def unfuddle_call_api(request,passthru=false)
  puts "[API] #{request}"
  data = RestClient.get("#{unfuddle_base_url}#{request}")
  return passthru ? data : JSON.parse(data)
end

def unfuddle_base_url
  "http://#{session[:username]}:#{session[:password]}@#{session[:subdomain]}.unfuddle.com/api/v1"
end

# enable :sessions # we meed more than 4K of data
use Rack::Session::Pool

[ '/login', '/login/:subdomain' ].each { |route| 
  get route do
    haml(:login)
  end
}


get '/logout' do
  [ :subdomain, :username, :password ].each { |k| session[k] = nil }
  redirect '/'
end

post '/login' do
  session[:subdomain] = params[:subdomain]
  session[:username] = params[:username]
  session[:password] = params[:password]
  
  session[:projects] = {}
  session[:people] = {}
  session[:milestones] = {}

  unfuddle_call_api('/projects.json').each { |p| session[:projects][p['id']] = p['title'] }
  unfuddle_call_api('/people.json').each { |p| session[:people][p['id']] = p['first_name']+' '+p['last_name'] }
  unfuddle_call_api('/milestones.json').each { |m| session[:milestones][m['project_id']].nil? ? session[:milestones][m['project_id']] = { m['id'] => m['title'] } : session[:milestones][m['project_id']][m['id']] = m['title'] }  
  
  redirect '/'
end

get '/' do
  session[:subdomain] ? haml(:index) : redirect('/login')
end

get '/tickets.js' do
  { :items => unfuddle_call_api('/ticket_reports/dynamic.json?conditions_string=assignee-eq-current,status-neq-closed,status-neq-resolved')['groups'].first['tickets'].map { |t| t.merge( 'project_name' => session[:projects][t['project_id']] )} }.to_json
end

get '/ticket/:project_id/:number.js' do
  @ticket = unfuddle_call_api("/projects/#{params[:project_id]}/tickets/by_number/#{params[:number]}.json")
  haml :detail, :layout => false
end
