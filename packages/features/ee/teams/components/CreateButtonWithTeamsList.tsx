import { trpc } from "@calcom/trpc/react";
import { CreateButton } from "@calcom/ui";
import type { CreateButtonProps, CreateButtonOption } from "@calcom/ui";

export function CreateButtonWithTeamsList(
  props: Omit<CreateButtonProps, "options"> & {
    onlyShowWithTeams?: boolean;
    onlyShowWithNoTeams?: boolean;
    isAdmin?: boolean;
    includeOrg?: boolean;
  }
) {
  const query = trpc.viewer.teamsAndUserProfilesQuery.useQuery({ includeOrg: props.includeOrg });
  if (!query.data) return null;

  const teamsAndUserProfiles: CreateButtonOption[] = query.data
    .filter((profile) => !profile.readOnly)
    .map((profile) => {
      return {
        teamId: profile.teamId,
        label: profile.name || profile.slug,
        image: profile.image,
        slug: profile.slug,
      };
    });

  if (props.isAdmin) {
    teamsAndUserProfiles.push({
      platform: true,
      label: "Platform",
      image: null,
      slug: null,
      teamId: null,
    });
  }

  if (props.onlyShowWithTeams && teamsAndUserProfiles.length < 2) return null;

  if (props.onlyShowWithNoTeams && teamsAndUserProfiles.length > 1) return null;

  return <CreateButton {...props} options={teamsAndUserProfiles} />;
}
