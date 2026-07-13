'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCourseStore } from '@/stores/course-store';
import { DIFFICULTY_OPTIONS, SORT_OPTIONS, LANDING_CATEGORIES } from '@/lib/constants';
import type { CourseDifficulty } from '@/types';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/services/api/courses.api';

/**
 * Bộ lọc danh sách khóa học (Theo giá, danh mục, đánh giá).
 */
export function CourseFilters() {
  const { 
    filters, 
    setSearch, 
    setCategory, 
    setDifficulty, 
    setSort,
    resetFilters
  } = useCourseStore();

  // Local state for search input to prevent lagging while typing
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // Sync local search when global filters reset
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => coursesApi.getCategories(),
  });

  const activeFilterCount = 
    (filters.category ? 1 : 0) + 
    (filters.difficulty ? 1 : 0) + 
    (filters.search ? 1 : 0);

  return (
    <div className="space-y-4 md:space-y-0 md:flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Tìm kiếm khóa học, kỹ năng..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 h-11 bg-background rounded-lg border-border focus-visible:ring-primary/20"
        />
        {localSearch && (
          <button 
            onClick={() => setLocalSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(val) => setCategory(val || '')}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background rounded-lg border-border">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.difficulty || "all"}
          onValueChange={(val) => setDifficulty((!val || val === 'all') ? '' : val as CourseDifficulty)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background rounded-lg border-border">
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi cấp độ</SelectItem>
            {DIFFICULTY_OPTIONS.map(diff => (
              <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sort} onValueChange={(val) => setSort((val || 'newest') as any)}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background rounded-lg border-border">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(sort => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters button (visible only when filters applied) */}
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            onClick={resetFilters}
            className="h-11 px-3 text-muted-foreground hover:text-destructive hidden lg:flex"
            title="Xóa bộ lọc"
          >
            <X className="h-4 w-4 mr-2" />
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  );
}
