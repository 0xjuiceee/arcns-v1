import { ethers } from "ethers";

export class OwnershipResolver {
  constructor(registry, nft, reverseRegistrar, provider, cache) {
    this.registry = registry;
    this.nft = nft;
    this.reverse = reverseRegistrar;
    this.provider = provider;
    this.cache = cache; // optional
  }

  async resolveDomain(domain) {
    const namehash = ethers.utils.namehash(domain);

    // 1. ALWAYS TRUST CHAIN FIRST
    const registryOwner = await this.safeRegistryOwner(namehash);

    if (registryOwner && registryOwner !== ethers.constants.AddressZero) {
      return {
        owner: registryOwner,
        source: "registry",
        domain
      };
    }

    // 2. NFT fallback (wrapped domains)
    const tokenId = this.toTokenId(namehash);
    const nftOwner = await this.safeNFTOwner(tokenId);

    if (nftOwner && nftOwner !== ethers.constants.AddressZero) {
      return {
        owner: nftOwner,
        source: "nft",
        domain
      };
    }

    // 3. Reverse lookup (optional UI feature)
    return {
      owner: null,
      source: "unresolved",
      domain
    };
  }

  async resolveAddress(address) {
    try {
      const name = await this.reverse.getName(address);
      return {
        name,
        source: "reverse"
      };
    } catch {
      return { name: null };
    }
  }

  async safeRegistryOwner(namehash) {
    try {
      return await this.registry.owner(namehash);
    } catch {
      return null;
    }
  }

  async safeNFTOwner(tokenId) {
    try {
      return await this.nft.ownerOf(tokenId);
    } catch {
      return null;
    }
  }

  toTokenId(namehash) {
    // ArcNS-specific mapping (adjust if needed)
    return BigInt(namehash).toString();
  }
}
