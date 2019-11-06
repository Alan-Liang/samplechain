Sample Blockchain
=================

```shell
for i in `seq 10001 10011`; do
  cd $i.run
  API_PORT=$i NODE_ENV=development node .. &
  cd ..
done
```
