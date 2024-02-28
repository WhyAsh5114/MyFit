<script lang="ts">
  import { page } from "$app/stores";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { signOut, signIn } from "@auth/sveltekit/client";

  $: ({ data } = $page);

  function getInitials(name?: string | null) {
    if (!name) return "";
    const words = name.split(" ");
    const initials = words.map((word) => word.charAt(0).toUpperCase());
    return initials.join("");
  }
</script>

{#if data.session}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button variant="ghost" class="px-1.5">
        <Avatar.Root class="w-6 h-6">
          <Avatar.Image
            src={data.session.user?.image}
            alt="profile-picture"
          />
          <Avatar.Fallback>{getInitials(data.session.user?.name)}</Avatar.Fallback>
        </Avatar.Root>
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item on:click={() => signOut()} class="text-red-500"
          >Log out</DropdownMenu.Item
        >
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{:else}
  <Button variant="ghost" on:click={() => signIn()}>Login</Button>
{/if}
