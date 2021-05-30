import gql from 'graphql-tag';
import { RESULT_INFO_FRAGMENT } from '@graphql/operations/fragment/result-info';
import { GENRE_FRAGMENT } from '@graphql/operations/fragment/genre';

export const GENRE_LIST_QUERY = gql`
    query genresList($page: Int, $itemsPage: Int) {
        genres(page: $page, itemsPage: $itemsPage) {
            info {
                ...ResultInfoObject
            }
            status
            message
            genres {
                ...GenreObject
            }
        }
    }
    ${ GENRE_FRAGMENT }
    ${ RESULT_INFO_FRAGMENT }
`;
