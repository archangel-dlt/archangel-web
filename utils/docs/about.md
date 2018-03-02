# ArchangelDLT Demo Web Application

This is a demonstrator for the ArchangelDLT project, aiming to showcase potential usage of Distributed Ledger Technology (a.k.a. Blockchains) for Archival and Memory Institutions.

## User's Manual

The [Archangel-DLT Demo Web Application](http://159.65.54.117/) allows users to search data on and upload data to a
blockchain. Using this demo, you can:

* Upload a file, and have a signature hash and other information about the file stored in the blockchain, as a proof of concept of how a DLT could be used to guarantee integrity of resources kept by archival institutions
* Search a given blockchain for a record of a file previously uploaded through any node using this system
* [monitor blockchain transactions](http://159.65.54.117/monitor/index.html), as a way to demonstrate the distributed nature of the record storage.

### Selecting a Blockchain

The application can operate against two distinct and separate blockchains - 
[Guardtime](https://guardtime.com/) and [Ethereum](https://www.ethereum.org/)

A menu at the top-right of the page can be used to select either. See section "Supported Blockchains" below for more information.

### Searching 

* Select the **Search** tab, enter the term in the box and click the **Search** button
* Any search results will be listed in reverse chronological order, showing filename, 
[PRONOM puid](http://www.nationalarchives.gov.uk/PRONOM/Default.aspx), file size, file last modified
date, the [DROID](http://www.nationalarchives.gov.uk/information-management/manage-information/preserving-digital-records/droid/)
file hash value, and any user provided comment.  If the result record was part 
of an archive file (zip, tar, etc), the containing file's hash is also given. 

### Uploading

* Select the **Upload** tab, and click and browse to select a file
* The selected file will be uploaded characterised with DROID
* Add any additional comments, then click the **Upload** button.

## Supported Blockchains

The application can operate against two distinct and separate blockchains - 
[Guardtime](https://guardtime.com/) and [Ethereum](https://www.ethereum.org/)

Use the **Driver** drop-down at the top-right of the page to select between Guardtime and Ethereum.

### Using Guardtime 

Guardtime provides centralised access to its blockchain through a web API.  Users must authenticate against 
the web API for every operation, whether read or write. The application's Guardtime driver will prompt for 
username and password on first use. 

The Guardtime credentials are
 
* ot.vT2ron
* AQm7DiXLyW5N

It doesn't cache the credentials, so will prompt once each session.

* Searching - Guardtime search uses *exact text matching*. Try 'batman papertoy.pdf'.
* Uploading - Guardtime uploads data immediately. 

### Using Ethereum

Using the Ethereum blockchain is a little more involved than using Guardtime. Ethereum is a decentralised
peer-to-peer network and to access the network, you need an Ethereum client of some sort. Various options, ordered 
from least to most tricky, are described below.  

* Searching - Ethereum search is *matches free text*.  Try 'pdf' or 'font'. 
* Uploading - writing to the Ethereum blockchain can take up to a minute, as the transaction has to
be verified by other nodes.  Be patient and the application will notify you when the transaction has 
completed. If you click away from the Upload tab or close the browser, the transaction will complete 
but you won't receive any notification. 

While anyone can search the Archangel data on Ethereum, the Archangel-DLT smart contract implements 
permissioned write - only those Ethereum addresses with permission may update the Archangel data. Once you've
created your address, please let me know and I'll grant the permission. To write to Ethereum, you will 
also need some Ether with which to pay for the transaction.  See below for details of how to request some.     

The Archangel contract raises an event every time a new entry is written to the blockchain. You can view all
these events on the [Ethereum event monitor](http://159.65.54.117/monitor) page.

#### MetaMask
MetaMask is a plugin for Chrome and Firefox which takes care of Ethereum account management and provides a client 
gateway for applications to use.  It is by far the most straightforward way to get going with Ethereum and 
I recommend you use it.

* [Chrome plugin](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)
* [Firefox plugin](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
 
The installation process will walk you through setting up an account.  Be sure to select **Rinkeby Test Net** 
from the selector in the top left of the MetaMask window.

#### Mist

[Mist](https://github.com/ethereum/mist/releases) is a web browser specifically built for Ethereum applications, which includes built in account management and
a full Ethereum client.

#### Local Geth instance

[Geth](https://github.com/ethereum/go-ethereum/wiki/Installing-Geth) is a full featured Ethereum client. It is rather 
beyond scope here to get into all its detail, but the minimal startup options needed are 
```sh
geth --rinkeby --rpc --rpccorsdomain="*" --rpcaddr="0.0.0.0" 
```
Alternatively, use our prepared Docker image 
```sh
docker run -p 8545:8545 -p 30303:30303 archangeldlt/rinkeby-client
```
In either case, on first run it will have to download the blockchain history. This will take several minutes.

If you choose to run your own Geth client, you will have to manually create and manage your Ethereum account.

#### Obtaining Ether
The Archangel smart contract is running on the Rinkeby test network. Rinkeby is a proof-of-authority network
and Ether is available on request from the [Rinkeby Faucet](https://faucet.rinkeby.io/). You can request 
various amounts, but 3 Ether should be plenty.

## For the more adventurous - Running the application

### The easy option
Don't. Use the hosted instance 

 * [Search and Upload](http://159.65.54.117/)
 * [Ethereum event monitor](http://159.65.54.117/monitor)

### The Docker option
The application is available as a [Docker image](https://hub.docker.com/r/archangeldlt/web/) 
which can be spun up directly using `docker run`
```sh
docker run -p 8000:5050 archangeldlt/web
``` 
or using `docker-compose` with the following docker-compose.yml

```yaml
version: '3'

services:
  archangelweb:
    image: archangeldlt/web
    ports:
      - "8000:5050"
```

Once it's up and running, go to [http://localhost:8000/](http://localhost:8000/)

The application webserver listens on port 5050, so that port needs to be published. I've chosen to map it to port 8000 here,
but you can changed that if need be.

Should also want to run a local Geth instance at the same time, that is most conveniently done using the prepared 
[rinkeby-client](https://hub.docker.com/r/archangeldlt/rinkeby-client/) Docker image and docker-compose 
```yaml
version: '3'

services:
  geth:
    image: archangeldlt/rinkeby-client
    ports:
      - "8545:8545"
      - "30303:30303"
  archangelweb:
    image: archangeldlt/web
    ports:
      - "8000:5050"
```      
Once created and started the Ethereum client will take a few minutes to download the blockchain.  To persist 
the blockchain outside the Docker container, update the docker-compose.yml to mount a volume at `/root`

### The from-source option

The source code is available in from the [Archangel-dlt Github repository](https://github.com/archangel-dlt/archangel-web)

Building and running this code requires need [Java](http://www.oracle.com/technetwork/java/javase/downloads/index.html) 
and [Node.js](https://nodejs.org/en/download/) installed. It should not need any other packages, nor 
does it require any of the other code in the Archangel-dlt project.

Run the code locally with 
```sh
./gradlew start
```

Or to build an installable package, use 
```sh
./gradlew buildDist
```
The distribution packages end up in `./back-end/build/distributions/`. To use them, unpack and run the appropriate
start up script in the `./bin` directory.

