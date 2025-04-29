export const genreFragment = {
  film_genre: ["*", { translations: ["*"] }],
};

export const crewRoleFragment = {
  film_crew_role: ["*", { translations: ["*"] }],
};

export const personFragment = {
  film_person: ["*"],
};

export const festivalBlockFragment = {
  festival_block: ["*", { translations: ["*"] }],
};

export const filmFragment = {
  film: [
    "*",
    { title_image: ["*"] },
    { translations: ["*"] },
    { genres: ["*", { film_genre_id: genreFragment.film_genre }] },
    {
      crew: [
        "*",
        { film_person_id: personFragment.film_person },
        {
          crew_roles: [
            "*",
            { film_crew_role_id: crewRoleFragment.film_crew_role },
          ],
        },
      ],
    },
    {
      actors: ["*", { film_person_id: personFragment.film_person }],
    },
    {
      festival_block: festivalBlockFragment.festival_block,
    },
  ],
};

export const votingFragment = {
  voting: ["*", { translations: ["*"], films: ["*"] }],
};

export const voteFragment = {
  vote: ["*", { voting_id: votingFragment.voting }, { films: ["*"] }],
};
