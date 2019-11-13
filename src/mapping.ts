import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Contract,
  ErrorOut,
  BatchTransfered,
  BatchMinted,
  BatchBurned,
  BatchForSale,
  Bought,
  OwnershipTransferred,
  MinterAdded,
  MinterRemoved,
  Transfer,
  Approval,
  ApprovalForAll
} from "../generated/Contract/Contract"
import { Thing, Token, Store } from "../generated/schema"



export function handleErrorOut(event: ErrorOut): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // // Entities only exist after they have been saved to the store;
  // // `null` checks allow to create entities on demand
  // if (entity == null) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

  //   // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  // }

  // // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // // Entity fields can be set based on event parameters
  // entity.error = event.params.error
  // entity.tokenId = event.params.tokenId

  // // Entities can be written to the store with `.save()`
  // entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.supportsInterface(...)
  // - contract.name(...)
  // - contract.getApproved(...)
  // - contract.totalSupply(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.tokenByIndex(...)
  // - contract.maker(...)
  // - contract.mintWithTokenURI(...)
  // - contract.ownerOf(...)
  // - contract.balanceOf(...)
  // - contract.owner(...)
  // - contract.isOwner(...)
  // - contract.symbol(...)
  // - contract.baseUri(...)
  // - contract.isMinter(...)
  // - contract.id(...)
  // - contract.items(...)
  // - contract.isApprovedForAll(...)
  // - contract.tokenURI(...)
  // - contract.tokensOfOwner(...)
}

export function handleBatchTransfered(event: BatchTransfered): void {
  // let contract = Contract.bind(event.address)
  // let totalSupply = contract.totalSupply()

  // if (totalSupply.toI32() == 0) {
  //   return
  // }

  // for (let i = 0; i < totalSupply.toI32(); ++i) {
  //   let id = contract.tokenByIndex(BigInt.fromI32(i + 1));

  //   let item = contract.items(id);

  //   let token = Token.load(id.toString())
  //   if (token == null) {
  //     return
  //   }
  //   token.state = item.value3.toString()
  //   token.save()
  // }
}


function setTokensAvailable(minter: Address, contract: Contract, metaId: string): void {

  let ids = contract.tokensOfOwner(minter);
  let states = new Array<string>(ids.length);

  for (let i = 0; i < states.length; ++i) {
    let item = contract.items(ids[i]);

    if (item.value2.toString() == metaId.toString()) {

      let token = Token.load(ids[i].toString())
      if (token == null) {
        token = new Token(ids[i].toString())
      }

      token.state = item.value3.toString()
      token.price = item.value1.toString()
      token.metaId = item.value2.toString()
      token.tokenId = ids[i].toString()
      token.resolvedThing = metaId;
      token.save()
    }
  }
}


export function handleBatchMinted(event: BatchMinted): void {

  let thing = Thing.load(event.params.metaId)
  if (thing == null) {
    thing = new Thing(event.params.metaId)
  }

  let contract = Contract.bind(event.address)
  let address = event.address.toHex()


  let store = Store.load(address)
  if (store == null) {
    store = new Store(address)
  }

  store.totalSupply = contract.totalSupply()

  thing.minter = event.params.minter;
  thing.metaId = event.params.metaId;
  thing.burned = false;
  thing.forSale = true;

  setTokensAvailable(event.params.minter, contract, event.params.metaId)

  thing.resolveStore = address

  store.save()
  thing.save()
}

export function handleBatchBurned(event: BatchBurned): void {
  let thing = Thing.load(event.params.metaId)
  if (thing == null) {
    return
  }
  thing.burned = true;
  thing.save();
}

export function handleBatchForSale(event: BatchForSale): void {
  let thing = Thing.load(event.params.metaId)
  if (thing == null) {
    return
  }
  thing.forSale = true;
  thing.save();
}


export function handleBought(event: Bought): void {
  let contract = Contract.bind(event.address)
  let totalSupply = contract.totalSupply()
  let metaId = event.params.metaId

  for (let i = 0; i < totalSupply.toI32(); ++i) {
    let id = contract.tokenByIndex(BigInt.fromI32(i));
    let item = contract.items(id);

    if (item.value2.toString() == metaId.toString()) {

      let token = Token.load(id.toString())

      token.state = item.value3.toString()
      token.save()
    }
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handleMinterAdded(event: MinterAdded): void { }

export function handleMinterRemoved(event: MinterRemoved): void { }

export function handleTransfer(event: Transfer): void {

  let token = Token.load(event.params.tokenId.toString())
  if (token == null) {
    return
  }
  token.state = '3'
  token.save()

}

export function handleApproval(event: Approval): void { }

export function handleApprovalForAll(event: ApprovalForAll): void { }
