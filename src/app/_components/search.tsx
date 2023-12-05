import { Input } from "~/app/_components/ui/input";

const Search = () => {
  return (
    <form className="w-6/12 sm:w-auto">
      <Input type="text" placeholder="Search..." />
    </form>
  );
};

export default Search;
