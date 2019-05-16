HOST="localhost:8000"

LOGIN=zabqer
EMAIL=zabqer@gmail.com
PASSWORD=testtest

echo "Backend setup script"

token=""

api_call () {
  data={
  argc=$#
  argv=($@)
  for (( j=2; j < argc; j++ )); do
      data="${data}\"${argv[j]}\":\"${argv[++j]}\""
      if [ $(($j + 1)) != $argc ]; then
        data=$data,
      fi
  done
  data=$data}
  t=""
  if [ ! -z "$token" ]; then
    t="Authorization: Token $token"
  fi
  curl "$HOST/api/$1" -H "Content-Type: application/json" -X $2 --data "$data" -H "$t" -s
}

echo "Creating user[login=$LOGIN, password=$PASSWORD]"
# data=$(api_call auth/register POST login $LOGIN password $PASSWORD email $EMAIL)
data=$(api_call auth/login POST login $LOGIN password $PASSWORD remember false)
echo $data
token=$(jq -r .token <<<"$data")

echo "Creating base universes, dimensions, etc..."

data=$(curl "$HOST/api/palettes" -H "Content-Type: application/json" -X POST --data '{"gradations":40,"colors":[16777215,0],"name":"Basic"}' -H "Authorization: Token $token" -s)
echo $data
pid=$(jq -r .id <<<"$data")
data=$(api_call universes POST function "v**n+z" initial "x+1j*y")
echo $data
id=$(jq -r .id <<<"$data")
data=$(curl "$HOST/api/dimensions" -H "Content-Type: application/json" -X POST --data "{\"parameter\":1.51,\"universe\":$id}" -H "Authorization: Token $token" -s)
echo $data
id=$(jq -r .id <<<"$data")
api_call fractals POST x "0.7" y "0.05" dimension $id palette $pid

echo "Logging out"
api_call auth/logout POST
